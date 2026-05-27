import { generatePasswordResetEmail } from '@/lib/email';

describe('generatePasswordResetEmail', () => {
  const resetUrl = 'https://example.com/reset-password-token-123';

  it('should generate an email with a username', () => {
    const userName = 'Jan Kowalski';
    const result = generatePasswordResetEmail(resetUrl, userName);

    expect(result.subject).toBe('Zresetuj swoje hasło w Prosta Sprawa');

    // Check greeting with username
    expect(result.text).toContain(`Cześć ${userName},`);
    expect(result.html).toContain(`Cześć ${userName},`);

    // Check if the URL is included
    expect(result.text).toContain(resetUrl);
    expect(result.html).toContain(resetUrl);
  });

  it('should generate an email without a username', () => {
    const result = generatePasswordResetEmail(resetUrl);

    expect(result.subject).toBe('Zresetuj swoje hasło w Prosta Sprawa');

    // Check fallback greeting
    expect(result.text).toContain('Cześć,');
    expect(result.text).not.toContain('Cześć undefined');

    expect(result.html).toContain('Cześć,');
    expect(result.html).not.toContain('Cześć undefined');

    // Check if the URL is included
    expect(result.text).toContain(resetUrl);
    expect(result.html).toContain(resetUrl);
  });

  it('should contain expected standard texts', () => {
    const result = generatePasswordResetEmail(resetUrl);

    expect(result.text).toContain('Otrzymujesz tę wiadomość, ponieważ poproszono o zresetowanie hasła dla Twojego konta.');
    expect(result.text).toContain('Link do resetowania hasła jest ważny przez 1 godzinę.');
    expect(result.text).toContain('Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.');

    expect(result.html).toContain('Otrzymujesz tę wiadomość, ponieważ poproszono o zresetowanie hasła dla Twojego konta.');
    expect(result.html).toContain('Link do resetowania hasła jest ważny przez 1 godzinę.');
    expect(result.html).toContain('Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.');
  });
});
