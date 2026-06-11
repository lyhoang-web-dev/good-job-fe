import {
  Toaster,
  ToastCloseTrigger,
  ToastDescription,
  ToastRoot,
  ToastTitle,
  createToaster,
} from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'bottom-end',
});

export function AppToaster() {
  return (
    <Toaster
      toaster={toaster}
      w="min(100dvw - 2rem, 22rem)"
    >
      {(toast) => (
        <ToastRoot key={toast.id}>
          {Boolean(toast.title) && <ToastTitle>{toast.title}</ToastTitle>}
          {Boolean(toast.description) && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
          <ToastCloseTrigger />
        </ToastRoot>
      )}
    </Toaster>
  );
}
