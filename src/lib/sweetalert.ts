import Swal from 'sweetalert2';
import type { SweetAlertOptions } from 'sweetalert2';

/**
 * SweetAlert2 helper with consistent theming for the app
 */

// Default configuration matching the app's soft violet theme
const defaultConfig: SweetAlertOptions = {
  confirmButtonColor: '#8b7fc7', // var(--color-primary)
  cancelButtonColor: '#9ca3af', // gray-400
  customClass: {
    popup: 'rounded-2xl shadow-2xl',
    title: 'text-2xl font-bold',
    htmlContainer: 'text-gray-600',
    confirmButton: 'px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all',
    cancelButton: 'px-6 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all',
  },
  buttonsStyling: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
};

/**
 * Show guest mode info (non-blocking, informative)
 * This is shown on first add to list for guests
 */
export async function showGuestModeInfo(): Promise<void> {
  await Swal.fire({
    ...defaultConfig,
    title: '📱 Guest Mode',
    html: `
      <div class="text-left space-y-3">
        <p class="text-gray-700">You're using the app in <strong>Guest Mode</strong>.</p>
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
          <p class="text-gray-700 mb-2"><strong>⚠️ Important:</strong></p>
          <ul class="list-disc list-inside space-y-1 text-gray-600">
            <li>Your data is stored locally on this device</li>
            <li>Data may be lost if you clear browser data</li>
            <li>Data won't sync across devices</li>
          </ul>
        </div>
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
          <p class="text-gray-700 mb-2"><strong>✨ Create an account to:</strong></p>
          <ul class="list-disc list-inside space-y-1 text-gray-600">
            <li>Save your data in the cloud</li>
            <li>Access your lists from any device</li>
            <li>Never lose your progress</li>
          </ul>
        </div>
        <p class="text-gray-600 text-sm text-center mt-4">You can continue using Guest Mode or sign up anytime.</p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Got it!',
    width: '600px',
  });
}

/**
 * Offer to migrate guest data to account
 */
export async function showDataMigrationOffer(itemCount: number): Promise<boolean> {
  const result = await Swal.fire({
    ...defaultConfig,
    title: '💾 Save Your Progress?',
    html: `
      <div class="text-left space-y-3">
        <p class="text-gray-700">
          You have <strong>${itemCount} item${itemCount !== 1 ? 's' : ''}</strong> saved in Guest Mode.
        </p>
        <p class="text-gray-700">
          Would you like to save ${itemCount !== 1 ? 'them' : 'it'} to your new account?
        </p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p class="text-gray-600">
            <strong>✓ Yes:</strong> Your guest data will be saved to the cloud
          </p>
          <p class="text-gray-600 mt-2">
            <strong>✗ No:</strong> Your guest data will be cleared
          </p>
        </div>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Save My Data',
    cancelButtonText: 'No, Start Fresh',
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Show confirmation before removing an item from the list
 */
export async function showRemoveConfirmation(itemTitle: string): Promise<boolean> {
  const result = await Swal.fire({
    ...defaultConfig,
    title: 'Remove from List?',
    html: `
      <div class="text-left space-y-2">
        <p class="text-gray-700">Are you sure you want to remove <strong>"${itemTitle}"</strong> from your list?</p>
        <p class="text-gray-600 text-sm">This action cannot be undone.</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Remove',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Show confirmation before changing status of an item
 */
export async function showStatusChangeConfirmation(
  itemTitle: string,
  newStatus: string
): Promise<boolean> {
  const statusLabels: Record<string, string> = {
    want_to_watch: 'Want to Watch',
    watching: 'Watching',
    completed: 'Completed',
  };

  const result = await Swal.fire({
    ...defaultConfig,
    title: 'Change Status?',
    html: `
      <div class="text-left space-y-2">
        <p class="text-gray-700">
          Move <strong>"${itemTitle}"</strong> to <strong>${statusLabels[newStatus]}</strong>?
        </p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Change',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Show success message
 */
export function showSuccess(title: string, message?: string): void {
  Swal.fire({
    ...defaultConfig,
    title,
    text: message,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
  });
}

/**
 * Show error message
 */
export function showError(title: string, message?: string): void {
  Swal.fire({
    ...defaultConfig,
    title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
  });
}

/**
 * Show loading state
 */
export function showLoading(title: string = 'Loading...'): void {
  Swal.fire({
    ...defaultConfig,
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

/**
 * Close any open SweetAlert
 */
export function closeAlert(): void {
  Swal.close();
}

/**
 * Generic confirmation dialog
 */
export async function showConfirmation(
  title: string,
  message: string,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
): Promise<boolean> {
  const result = await Swal.fire({
    ...defaultConfig,
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Show duplicate email error
 */
export async function showDuplicateEmailError(): Promise<void> {
  await Swal.fire({
    ...defaultConfig,
    title: '📧 Email Already Registered',
    html: `
      <div class="text-left space-y-3">
        <p class="text-gray-700">This email address is already associated with an account.</p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p class="text-gray-700 mb-2"><strong>Already have an account?</strong></p>
          <p class="text-gray-600">Please use the <strong>Sign In</strong> option instead.</p>
        </div>
        <p class="text-gray-600 text-sm">
          If you forgot your password, you can reset it from the sign in page.
        </p>
      </div>
    `,
    icon: 'error',
    confirmButtonText: 'Got it',
    width: '500px',
  });
}

/**
 * Show authentication error with user-friendly message
 */
export async function showAuthError(errorMessage: string): Promise<void> {
  // Map common Supabase error messages to user-friendly ones
  const friendlyMessages: Record<string, { title: string; message: string }> = {
    'Invalid login credentials': {
      title: '🔒 Invalid Credentials',
      message: 'The email or password you entered is incorrect. Please check and try again.',
    },
    'Email not confirmed': {
      title: '📧 Email Not Verified',
      message: 'Please check your email and click the verification link to activate your account.',
    },
    'User already registered': {
      title: '📧 Email Already Registered',
      message: 'This email is already registered. Please sign in instead or use a different email.',
    },
  };

  // Find matching error message
  let title = '⚠️ Authentication Error';
  let message = errorMessage;

  for (const [key, value] of Object.entries(friendlyMessages)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      title = value.title;
      message = value.message;
      break;
    }
  }

  await Swal.fire({
    ...defaultConfig,
    title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
  });
}
