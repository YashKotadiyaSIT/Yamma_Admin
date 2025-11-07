import { Pipe, PipeTransform } from '@angular/core';
import { VerificationStatus } from '../Constants/EnumConstants';

@Pipe({
  name: 'verificationStatusPipe',
  standalone: false
})
export class VerificationStatusPipePipe implements PipeTransform {

transform(value: number): string {
  const status = Number(value);
    switch (status) {
      case VerificationStatus.Approved:
        return 'Approved';
      case VerificationStatus.Pending:
        return 'Pending';
      case VerificationStatus.Rejected:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

}
