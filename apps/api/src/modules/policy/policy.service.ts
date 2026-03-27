import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@repo/db';
import { PolicyStatus } from '@repo/types';

@Injectable()
export class PolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPolicies() {
    return this.prisma.policy.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        status: true,
        pageCount: true,
        createdAt: true,
      },
    });
  }

  async getPolicyById(id: string) {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found.`);
    }

    return policy;
  }

  async deletePolicy(id: string) {
    // Check if exists
    await this.getPolicyById(id);
    
    // Chunks relation is set to Cascade on delete in schema, so this drops chunks automatically
    return this.prisma.policy.delete({
      where: { id },
    });
  }

  async createPendingPolicy(fileName: string, fileUrl: string) {
    return this.prisma.policy.create({
      data: {
        fileName,
        fileUrl,
        status: PolicyStatus.PENDING,
      },
    });
  }

  async updatePolicyStatus(id: string, status: PolicyStatus, pageCount?: number) {
    return this.prisma.policy.update({
      where: { id },
      data: { status, pageCount },
    });
  }
}
