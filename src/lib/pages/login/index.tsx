import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { toaster } from '@/lib/components/ui/toaster';
import { useLogin } from '@/lib/hooks/useLogin';
import { authService } from '@/lib/services/auth';

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export default function LoginPage() {
  const search = useSearch({ from: '/login' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: login, isPending } = useLogin();

  useEffect(() => {
    if (search.error === 'google_auth_failed') {
      toaster.create({
        type: 'error',
        title: 'Google sign-in failed',
        description: 'Please try again or use email and password.',
        duration: 5000,
      });
    }
  }, [search.error]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!email) {
      e.email = 'Email is required';
    } else if (!EMAIL_PATTERN.test(email)) {
      e.email = 'Invalid email';
    }
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Minimum 6 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      return;
    }
    login({ email, password });
  }

  return (
    <Box
      alignItems="center"
      bg="#FAFAF8"
      display="flex"
      justifyContent="center"
      minHeight="100dvh"
      padding={4}
    >
      <Box
        bg="surface.elevated"
        borderColor="border.subtle"
        borderRadius="2xl"
        borderWidth="1px"
        maxWidth="420px"
        padding={8}
        shadow="dropdown"
        width="full"
      >
        <Stack align="center" gap={1} marginBottom={8}>
          <Heading
            color="brand.ink"
            fontFamily="heading"
            fontSize="2xl"
            fontStyle="italic"
            fontWeight="semibold"
          >
            Good Job
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            Recognise great work
          </Text>
        </Stack>

        <Button
          gap={2}
          marginBottom={4}
          onClick={() => authService.loginWithGoogle()}
          size="lg"
          variant="outline"
          width="full"
        >
          <img
            alt=""
            height={16}
            src="https://www.google.com/favicon.ico"
            width={16}
          />
          Sign in with Google
        </Button>

        <Box marginBottom={4} position="relative">
          <Separator />
          <Text
            bg="surface.elevated"
            color="fg.muted"
            fontSize="xs"
            left="50%"
            paddingX={2}
            position="absolute"
            top="50%"
            transform="translate(-50%, -50%)"
          >
            or continue with email
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Field.Root invalid={!!errors.email}>
              <Field.Label fontSize="sm" fontWeight="medium">
                Email
              </Field.Label>
              <Input
                autoComplete="email"
                borderRadius="xl"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                size="lg"
                type="email"
                value={email}
              />
              <Field.ErrorText>{errors.email}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.password}>
              <Field.Label fontSize="sm" fontWeight="medium">
                Password
              </Field.Label>
              <Box position="relative" width="inherit">
                <Input
                  autoComplete="current-password"
                  borderRadius="xl"
                  onChange={(e) => setPassword(e.target.value)}
                  paddingEnd="12"
                  placeholder="••••••••"
                  size="lg"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                />
                <Button
                  onClick={() => setShowPass(!showPass)}
                  position="absolute"
                  right={2}
                  size="sm"
                  tabIndex={-1}
                  top="50%"
                  transform="translateY(-50%)"
                  type="button"
                  variant="ghost"
                >
                  {showPass ? '🙈' : '👁'}
                </Button>
              </Box>
              <Field.ErrorText>{errors.password}</Field.ErrorText>
            </Field.Root>

            <Button
              _hover={{ bg: '#2D2D4E' }}
              bg="brand.ink"
              borderRadius="full"
              color="white"
              fontWeight="semibold"
              loading={isPending}
              loadingText="Signing in..."
              marginTop={2}
              size="lg"
              type="submit"
              width="full"
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
