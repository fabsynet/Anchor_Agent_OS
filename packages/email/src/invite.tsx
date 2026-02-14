import * as React from 'react';
import { Text, Button, Section } from '@react-email/components';
import { EmailLayout } from './components/layout';

interface InviteEmailProps {
  inviterName: string;
  agencyName: string;
  role: string;
  acceptUrl: string;
}

const navy = '#0f172a';
const white = '#ffffff';
const gray = '#64748b';

export function InviteEmail({
  inviterName = 'Jane Smith',
  agencyName = 'Smith Insurance Group',
  role = 'Agent',
  acceptUrl = 'https://app.anchor.com/accept-invite',
}: InviteEmailProps) {
  return (
    <EmailLayout preview={`${inviterName} has invited you to join ${agencyName} on Anchor`}>
      <Text style={headingStyle}>You have been invited!</Text>

      <Text style={bodyTextStyle}>
        <strong>{inviterName}</strong> has invited you to join{' '}
        <strong>{agencyName}</strong> on Anchor as a{' '}
        <strong>{role}</strong>.
      </Text>

      <Text style={bodyTextStyle}>
        Anchor is an insurance agent operating system that keeps your agency
        running smoothly. Accept the invitation below to create your account
        and get started.
      </Text>

      <Section style={buttonContainerStyle}>
        <Button style={buttonStyle} href={acceptUrl}>
          Accept Invitation
        </Button>
      </Section>

      <Text style={footnoteStyle}>
        This invitation will expire in 7 days. If you did not expect this
        invitation, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}

export default InviteEmail;

const headingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: navy,
  margin: '0 0 16px 0',
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#334155',
  margin: '0 0 16px 0',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: navy,
  color: white,
  fontSize: '15px',
  fontWeight: 600,
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
};

const footnoteStyle: React.CSSProperties = {
  fontSize: '13px',
  color: gray,
  margin: '24px 0 0 0',
  lineHeight: '20px',
};
