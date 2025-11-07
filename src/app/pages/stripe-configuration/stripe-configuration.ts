import { Component } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-stripe-configuration',
  standalone: false,
  templateUrl: './stripe-configuration.html',
  styleUrl: './stripe-configuration.scss',
})
export class StripeConfiguration {
  ngOnInit(): void {
    this.confirmAndRedirectToStripe();
  }

  async confirmAndRedirectToStripe() {
    const result: SweetAlertResult = await Swal.fire({
      title: 'Redirect to Stripe Dashboard?',
      text: "You are about to leave this application and go to the Stripe Dashboard. You will need to log in there with your Stripe credentials.",
      icon: 'warning', // Icon to use
      showCancelButton: false,
      confirmButtonColor: '#635bff', // Stripe's primary color
      confirmButtonText: 'Yes, Go to Dashboard!',
    });

    if (result.isConfirmed) {
      const mainStripeLoginUrl = 'https://dashboard.stripe.com/login';
      window.open(mainStripeLoginUrl, '_blank');
    } 
    
  }
}
