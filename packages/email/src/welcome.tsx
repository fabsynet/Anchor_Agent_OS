import * as React from 'react';
import { Text, Section } from '@react-email/components';
import { EmailLayout } from './components/layout';

interface WelcomeEmailProps {
  firstName: string;
}

const navy = '#0f172a';

export function WelcomeEmail({
  firstName = 'there',
}: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to Anchor, ${firstName}!`}>
      <Text style={headingStyle}>
        Welcome to Anchor, {firstName}!
      </Text>

      <Text style={bodyTextStyle}>
        Your account is ready. Anchor helps your insurance agency stay
        organized — from client management to policy renewals, task tracking,
        and expense management.
      </Text>

      <Section style={featureListStyle}>
        <Text style={featureItemStyle}>
          - Manage clients and policies in one place
        </Text>
        <Text style={featureItemStyle}>
          - Never miss a renewal or follow-up
        </Text>
        <Text style={featureItemStyle}>
          - Track expenses and documents effortlessly
        </Text>
        <Text style={featureItemStyle}>
          - Collaborate with your team seamlessly
        </Text>
      </Section>

      <Text style={bodyTextStyle}>
        If you have any questions, just reply to this email. We are here to
        help you get the most out of Anchor.
      </Text>

      <Text style={signoffStyle}>
        The Anchor Team
      </Text>
    </EmailLayout>
  );
}

export default WelcomeEmail;

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

const featureListStyle: React.CSSProperties = {
  margin: '8px 0 24px 0',
  padding: '16px 24px',
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
};

const featureItemStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#475569',
  margin: '0',
};

const signoffStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#334155',
  fontWeight: 600,
  margin: '24px 0 0 0',
};
