import { IsSafeRepositoryUrlConstraint } from '../../src/validators/safe-repository-url.validator'

describe('IsSafeRepositoryUrlConstraint', () => {
  let validator: IsSafeRepositoryUrlConstraint

  beforeEach(() => {
    validator = new IsSafeRepositoryUrlConstraint()
  })

  describe('valid URLs', () => {
    it('should accept GitHub URLs', () => {
      expect(validator.validate('https://github.com/facebook/react')).toBe(true)
      expect(validator.validate('https://github.com/vercel/next.js')).toBe(true)
    })

    it('should accept GitLab URLs', () => {
      expect(validator.validate('https://gitlab.com/gitlab-org/gitlab')).toBe(true)
    })

    it('should accept Bitbucket URLs', () => {
      expect(validator.validate('https://bitbucket.org/atlassian/python-bitbucket')).toBe(true)
    })

    it('should accept Codeberg URLs', () => {
      expect(validator.validate('https://codeberg.org/forgejo/forgejo')).toBe(true)
    })
  })

  describe('SSRF prevention - blocked URLs', () => {
    it('should block localhost', () => {
      expect(validator.validate('http://localhost/repo')).toBe(false)
      expect(validator.validate('http://localhost:3000/repo')).toBe(false)
    })

    it('should block 127.0.0.1 (loopback)', () => {
      expect(validator.validate('http://127.0.0.1/repo')).toBe(false)
      expect(validator.validate('http://127.0.0.1:8080/repo')).toBe(false)
    })

    it('should block private IP ranges (10.x.x.x)', () => {
      expect(validator.validate('http://10.0.0.1/repo')).toBe(false)
      expect(validator.validate('http://10.255.255.255/repo')).toBe(false)
    })

    it('should block private IP ranges (172.16-31.x.x)', () => {
      expect(validator.validate('http://172.16.0.1/repo')).toBe(false)
      expect(validator.validate('http://172.31.255.255/repo')).toBe(false)
      // 172.32.x.x is not private, but we still block numeric IPs
    })

    it('should block private IP ranges (192.168.x.x)', () => {
      expect(validator.validate('http://192.168.1.1/repo')).toBe(false)
      expect(validator.validate('http://192.168.0.100/repo')).toBe(false)
    })

    it('should block AWS metadata endpoint', () => {
      expect(validator.validate('http://169.254.169.254/latest/meta-data')).toBe(false)
      expect(validator.validate('http://169.254.169.254/')).toBe(false)
    })

    it('should block link-local addresses', () => {
      expect(validator.validate('http://169.254.1.1/repo')).toBe(false)
    })

    it('should block 0.0.0.0', () => {
      expect(validator.validate('http://0.0.0.0/repo')).toBe(false)
    })

    it('should block IPv6 localhost', () => {
      expect(validator.validate('http://::1/repo')).toBe(false)
    })
  })

  describe('protocol validation', () => {
    it('should block non-HTTP protocols', () => {
      expect(validator.validate('file:///etc/passwd')).toBe(false)
      expect(validator.validate('ftp://github.com/user/repo')).toBe(false)
      expect(validator.validate('ssh://github.com/user/repo')).toBe(false)
    })

    it('should allow HTTPS', () => {
      expect(validator.validate('https://github.com/user/repo')).toBe(true)
    })

    it('should allow HTTP (for development)', () => {
      expect(validator.validate('http://github.com/user/repo')).toBe(true)
    })
  })

  describe('credentials in URL', () => {
    it('should block URLs with embedded credentials', () => {
      expect(validator.validate('https://user:pass@github.com/user/repo')).toBe(false)
      expect(validator.validate('https://token@github.com/user/repo')).toBe(false)
    })
  })

  describe('invalid inputs', () => {
    it('should reject null/undefined/empty', () => {
      expect(validator.validate(null as any)).toBe(false)
      expect(validator.validate(undefined as any)).toBe(false)
      expect(validator.validate('')).toBe(false)
    })

    it('should reject invalid URLs', () => {
      expect(validator.validate('not-a-url')).toBe(false)
      expect(validator.validate('github.com/user/repo')).toBe(false) // no protocol
    })
  })
})
