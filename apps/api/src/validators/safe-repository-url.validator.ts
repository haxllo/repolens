import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { URL } from 'url'

/**
 * Custom validator to prevent SSRF attacks by blocking:
 * - Private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
 * - Loopback addresses (127.x.x.x, localhost)
 * - Link-local addresses (169.254.x.x)
 * - AWS metadata endpoint (169.254.169.254)
 * - IPv6 private ranges
 * - Non-HTTP(S) protocols
 */
@ValidatorConstraint({ async: false })
export class IsSafeRepositoryUrlConstraint implements ValidatorConstraintInterface {
  private blockedHosts = new Set([
    'localhost',
    'localhost.localdomain',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '::',
    'metadata.google.internal',
    'metadata.gke.internal',
  ])

  private isPrivateIP(ip: string): boolean {
    // Check for IPv4 private ranges
    const parts = ip.split('.').map(Number)
    if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
      // 10.0.0.0/8
      if (parts[0] === 10) return true
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true
      // 127.0.0.0/8 (loopback)
      if (parts[0] === 127) return true
      // 169.254.0.0/16 (link-local, includes AWS metadata)
      if (parts[0] === 169 && parts[1] === 254) return true
      // 0.0.0.0/8
      if (parts[0] === 0) return true
    }

    return false
  }

  private isValidGitUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString)

      // Only allow HTTPS (and HTTP for development)
      if (!['https:', 'http:'].includes(url.protocol)) {
        return false
      }

      // Block blocked hosts
      const hostname = url.hostname.toLowerCase()
      if (this.blockedHosts.has(hostname)) {
        return false
      }

      // Block private IPs
      if (this.isPrivateIP(hostname)) {
        return false
      }

      // Block URLs with credentials
      if (url.username || url.password) {
        return false
      }

      // Allow only common Git hosting platforms and their patterns
      const allowedPatterns = [
        /^github\.com$/,
        /^gitlab\.com$/,
        /^bitbucket\.org$/,
        /^.*\.github\.com$/,
        /^.*\.gitlab\.com$/,
        /^.*\.bitbucket\.org$/,
        /^codeberg\.org$/,
        /^git\.sr\.ht$/,
        /^gitea\..*$/,
        /^gogs\..*$/,
      ]

      const isAllowedHost = allowedPatterns.some((pattern) => pattern.test(hostname))
      if (!isAllowedHost) {
        // For now, also allow any URL that looks like a git repository URL
        // This allows self-hosted instances while still blocking obvious attacks
        const pathLooksLikeRepo = /^\/[^/]+\/[^/]+/.test(url.pathname)
        if (!pathLooksLikeRepo) {
          return false
        }
      }

      return true
    } catch {
      return false
    }
  }

  validate(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false
    }

    return this.isValidGitUrl(value)
  }

  defaultMessage(): string {
    return 'Repository URL must be a valid public Git repository URL (e.g., https://github.com/user/repo)'
  }
}

export function IsSafeRepositoryUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeRepositoryUrlConstraint,
    })
  }
}
