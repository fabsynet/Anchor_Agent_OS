"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2, Mail, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { RECIPIENT_FILTERS } from "@anchor/shared";

import { api } from "@/lib/api";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SendResult {
  sentCount: number;
  failedCount: number;
}

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx";

const MARKETING_TABS = [
  { label: "Email History", href: "/marketing" },
  { label: "Compose", href: "/marketing/compose", adminOnly: true },
  { label: "Settings", href: "/marketing/settings", adminOnly: true },
];

export default function ComposeEmailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isLoading: isUserLoading } = useUser();
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.replace("/marketing");
    }
  }, [isAdmin, isUserLoading, router]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (files.length > remaining) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} files total`);
      return;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 5 MB limit`);
        return;
      }
    }

    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this email to ${getRecipientLabel(recipientFilter)}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("subject", subject.trim());
      formData.append("body", body.trim());
      formData.append("recipientFilter", recipientFilter);
      for (const file of attachments) {
        formData.append("attachments", file);
      }

      const result = await api.upload<SendResult>("/api/communications/send", formData);
      toast.success(
        `Email sent to ${result.sentCount} recipient${result.sentCount !== 1 ? "s" : ""}${result.failedCount > 0 ? ` (${result.failedCount} failed)` : ""}`
      );
      router.push("/marketing");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send email";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const visibleTabs = MARKETING_TABS.filter(
    (tab) => !tab.adminOnly || isAdmin
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
        <p className="text-muted-foreground">
          Manage client communications, email history, and outreach settings.
        </p>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-4 border-b overflow-x-auto">
        {visibleTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "pb-2 text-sm font-medium transition-colors hover:text-foreground",
              pathname === tab.href
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-900/50 dark:bg-yellow-900/20">
        <AlertTriangle className="size-5 shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Bulk emails are for operational announcements only (e.g., office hours
          changes, important notices). Do not use for unsolicited promotional
          content.
        </p>
      </div>

      {/* Compose Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            New Email
          </CardTitle>
          <CardDescription>
            This message will be sent as a service communication from your
            agency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipient Filter */}
          <div className="space-y-2">
            <Label htmlFor="recipientFilter">Recipients</Label>
            <Select
              value={recipientFilter}
              onValueChange={setRecipientFilter}
            >
              <SelectTrigger id="recipientFilter" className="w-full sm:w-80">
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                {RECIPIENT_FILTERS.map((rf) => (
                  <SelectItem key={rf.value} value={rf.value}>
                    {rf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {subject.length}/200 characters
            </p>
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Write your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              maxLength={10000}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {body.length}/10000 characters. This message will be sent as a
              service communication from your agency.
            </p>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_EXTENSIONS}
              className="hidden"
              onChange={handleFilesSelected}
            />
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= MAX_ATTACHMENTS}
              >
                <Paperclip className="size-4" />
                Attach Files
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to {MAX_ATTACHMENTS} files, 5 MB each. PDF, images, Word, or Excel.
              </p>
            </div>
            {attachments.length > 0 && (
              <ul className="space-y-1">
                {attachments.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                  >
                    <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="ml-auto shrink-0 rounded p-0.5 hover:bg-muted"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !body.trim()}
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              {sending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRecipientLabel(filter: string): string {
  const found = RECIPIENT_FILTERS.find((rf) => rf.value === filter);
  return found ? found.label.toLowerCase() : "selected recipients";
}
