import { Controller, Get, Param, Delete } from '@nestjs/common';
import { PolicyService } from './policy.service';

@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  async getAllPolicies() {
    return this.policyService.getAllPolicies();
  }

  @Get(':id')
  async getPolicyById(@Param('id') id: string) {
    return this.policyService.getPolicyById(id);
  }

  @Delete(':id')
  async deletePolicy(@Param('id') id: string) {
    await this.policyService.deletePolicy(id);
    return { success: true, message: 'Policy deleted successfully' };
  }

  @Get(':id/messages')
  async getPolicyMessages(@Param('id') id: string) {
    return this.policyService.getMessagesByPolicyId(id);
  }
}
