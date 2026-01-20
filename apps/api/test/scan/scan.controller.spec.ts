import { Test, TestingModule } from '@nestjs/testing'
import { ScanController } from '../../src/scan/scan.controller'
import { ScanService } from '../../src/scan/scan.service'
import { CreateScanDto } from '../../src/scan/dto/create-scan.dto'
import { PrismaService } from '../../src/prisma/prisma.service'
import { ScanOwnerGuard } from '../../src/auth/scan-owner.guard'

describe('ScanController', () => {
  let controller: ScanController
  let service: ScanService

  const mockScanService = {
    createScan: jest.fn(),
    getScanStatus: jest.fn(),
    getScanResults: jest.fn(),
    updateScanStatus: jest.fn(),
  }

  const mockPrismaService = {
    scan: {
      findUnique: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanController],
      providers: [
        {
          provide: ScanService,
          useValue: mockScanService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        ScanOwnerGuard,
      ],
    }).compile()

    controller = module.get<ScanController>(ScanController)
    service = module.get<ScanService>(ScanService)

    jest.clearAllMocks()
  })

  describe('createScan', () => {
    it('should create a scan and return scan info', async () => {
      const dto: CreateScanDto = {
        repoUrl: 'https://github.com/facebook/react',
        branch: 'main',
      }
      const user = { id: 'user-123', email: 'test@example.com' }
      const expectedResult = {
        scanId: 'scan-123',
        status: 'queued',
        message: 'Repository scan has been queued for analysis',
      }

      mockScanService.createScan.mockResolvedValue(expectedResult)

      const result = await controller.createScan(dto, user)

      expect(result).toEqual(expectedResult)
      expect(mockScanService.createScan).toHaveBeenCalledWith(dto, user.id)
    })

    it('should handle unauthenticated users (user is undefined)', async () => {
      const dto: CreateScanDto = {
        repoUrl: 'https://github.com/facebook/react',
      }
      const expectedResult = {
        scanId: 'scan-456',
        status: 'queued',
        message: 'Repository scan has been queued for analysis',
      }

      mockScanService.createScan.mockResolvedValue(expectedResult)

      const result = await controller.createScan(dto, undefined)

      expect(result).toEqual(expectedResult)
      expect(mockScanService.createScan).toHaveBeenCalledWith(dto, undefined)
    })
  })

  describe('getScanStatus', () => {
    it('should return scan status', async () => {
      const scanId = 'scan-123'
      const expectedResult = {
        scanId,
        status: 'processing',
        progress: 50,
        createdAt: new Date(),
      }

      mockScanService.getScanStatus.mockResolvedValue(expectedResult)

      const result = await controller.getScanStatus(scanId)

      expect(result).toEqual(expectedResult)
      expect(mockScanService.getScanStatus).toHaveBeenCalledWith(scanId)
    })

    it('should return not_found for unknown scan', async () => {
      const scanId = 'unknown-scan'
      const expectedResult = {
        scanId,
        status: 'not_found',
        error: 'Scan not found',
      }

      mockScanService.getScanStatus.mockResolvedValue(expectedResult)

      const result = await controller.getScanStatus(scanId)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('getScanResults', () => {
    it('should return scan results when completed', async () => {
      const scanId = 'scan-123'
      const expectedResult = {
        scanId,
        status: 'completed',
        results: {
          languages: { javascript: 0.8, typescript: 0.2 },
          riskScores: { overall: 45 },
        },
      }

      mockScanService.getScanResults.mockResolvedValue(expectedResult)

      const result = await controller.getScanResults(scanId)

      expect(result).toEqual(expectedResult)
      expect(mockScanService.getScanResults).toHaveBeenCalledWith(scanId)
    })

    it('should return error when scan is not complete', async () => {
      const scanId = 'scan-123'
      const expectedResult = {
        scanId,
        status: 'processing',
        error: 'Scan is not yet complete',
      }

      mockScanService.getScanResults.mockResolvedValue(expectedResult)

      const result = await controller.getScanResults(scanId)

      expect(result).toEqual(expectedResult)
    })
  })

  describe('updateScanStatus', () => {
    it('should update scan status (for worker)', async () => {
      const scanId = 'scan-123'
      const body = {
        status: 'COMPLETED',
        results: { summary: 'Analysis complete' },
      }
      const expectedResult = { id: scanId, status: 'COMPLETED' }

      mockScanService.updateScanStatus.mockResolvedValue(expectedResult)

      const result = await controller.updateScanStatus(scanId, body)

      expect(result).toEqual(expectedResult)
      expect(mockScanService.updateScanStatus).toHaveBeenCalledWith(
        scanId,
        body.status,
        body.results,
        undefined
      )
    })

    it('should handle failed status with error message', async () => {
      const scanId = 'scan-123'
      const body = {
        status: 'FAILED',
        error: 'Repository not found',
      }
      const expectedResult = { id: scanId, status: 'FAILED', errorMessage: body.error }

      mockScanService.updateScanStatus.mockResolvedValue(expectedResult)

      const result = await controller.updateScanStatus(scanId, body)

      expect(mockScanService.updateScanStatus).toHaveBeenCalledWith(
        scanId,
        body.status,
        undefined,
        body.error
      )
    })
  })
})
