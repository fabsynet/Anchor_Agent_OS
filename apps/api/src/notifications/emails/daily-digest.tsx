import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
  Link,
} from '@react-email/components';

export interface DigestTask {
  id: string;
  title: string;
  dueDate: string | null;
  clientName: string | null;
  priority: string;
}

export interface DigestRenewal {
  id: string;
  title: string;
  dueDate: string | null;
  clientName: string | null;
  daysRemaining: number | null;
}

export interface DigestData {
  userName: string;
  overdueTasks: DigestTask[];
  renewalMilestones: DigestRenewal[];
  date: string;
}

const ANCHOR_NAVY = '#1e3a5f';

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: '0' as const,
    padding: '0' as const,
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
  },
  header: {
    backgroundColor: ANCHOR_NAVY,
    padding: '24px 32px',
    borderRadius: '8px 8px 0 0',
  },
  headerText: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    margin: '0' as const,
  },
  content: {
    padding: '24px 32px',
  },
  greeting: {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '24px',
  },
  sectionTitle: {
    color: ANCHOR_NAVY,
    fontSize: '18px',
    fontWeight: '600' as const,
    marginTop: '24px',
    marginBottom: '12px',
  },
  taskItem: {
    padding: '12px 16px',
    backgroundColor: '#fff4f4',
    borderLeft: '4px solid #e53e3e',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  renewalItem: {
    padding: '12px 16px',
    backgroundColor: '#fffff0',
    borderLeft: '4px solid #d69e2e',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#333333',
    margin: '0 0 4px 0',
  },
  itemMeta: {
    fontSize: '12px',
    color: '#666666',
    margin: '0' as const,
  },
  priorityBadge: {
    display: 'inline-block' as const,
    fontSize: '11px',
    fontWeight: '600' as const,
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
  },
  emptyState: {
    fontSize: '14px',
    color: '#999999',
    fontStyle: 'italic' as const,
    padding: '12px 0',
  },
  footer: {
    padding: '24px 32px',
    borderTop: '1px solid #eaeaea',
  },
  footerText: {
    fontSize: '12px',
    color: '#999999',
    lineHeight: '20px',
  },
  hr: {
    borderColor: '#eaeaea',
    margin: '24px 0',
  },
};

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '#e53e3e';
    case 'high':
      return '#dd6b20';
    case 'medium':
      return '#d69e2e';
    case 'low':
      return '#38a169';
    default:
      return '#718096';
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No date';
  try {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

export function DailyDigestEmail({
  userName,
  overdueTasks,
  renewalMilestones,
  date,
}: DigestData) {
  const previewText = `Daily Digest: ${overdueTasks.length} overdue task${overdueTasks.length !== 1 ? 's' : ''}, ${renewalMilestones.length} upcoming renewal${renewalMilestones.length !== 1 ? 's' : ''}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.headerText}>Anchor Daily Digest</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>
              Good morning, {userName}! Here is your daily summary for{' '}
              {date}.
            </Text>

            {/* Overdue Tasks Section */}
            <Heading as="h2" style={styles.sectionTitle}>
              Overdue Tasks ({overdueTasks.length})
            </Heading>
            {overdueTasks.length === 0 ? (
              <Text style={styles.emptyState}>
                No overdue tasks. You are all caught up!
              </Text>
            ) : (
              overdueTasks.map((task) => (
                <Section key={task.id} style={styles.taskItem}>
                  <Text style={styles.itemTitle}>{task.title}</Text>
                  <Text style={styles.itemMeta}>
                    Due: {formatDate(task.dueDate)}
                    {task.clientName ? ` | Client: ${task.clientName}` : ''}
                    {` | Priority: ${task.priority.toUpperCase()}`}
                  </Text>
                </Section>
              ))
            )}

            <Hr style={styles.hr} />

            {/* Renewal Milestones Section */}
            <Heading as="h2" style={styles.sectionTitle}>
              Upcoming Renewal Milestones ({renewalMilestones.length})
            </Heading>
            {renewalMilestones.length === 0 ? (
              <Text style={styles.emptyState}>
                No upcoming renewal milestones.
              </Text>
            ) : (
              renewalMilestones.map((renewal) => (
                <Section key={renewal.id} style={styles.renewalItem}>
                  <Text style={styles.itemTitle}>{renewal.title}</Text>
                  <Text style={styles.itemMeta}>
                    Due: {formatDate(renewal.dueDate)}
                    {renewal.clientName
                      ? ` | Client: ${renewal.clientName}`
                      : ''}
                    {renewal.daysRemaining !== null
                      ? ` | ${renewal.daysRemaining} day${renewal.daysRemaining !== 1 ? 's' : ''} remaining`
                      : ''}
                  </Text>
                </Section>
              ))
            )}
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is your daily digest from Anchor. To stop receiving these
              emails, update your notification preferences in{' '}
              <Link href="#" style={{ color: ANCHOR_NAVY }}>
                Settings
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DailyDigestEmail;
