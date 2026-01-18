"use client";

import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, X, Loader2, ExternalLink, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSubmission } from "@/lib/submission-actions";
import { toast } from "sonner";
import type { SubmissionLink } from "@/lib/types";
import Link from "next/link";

function CreateSubmissionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId");
    const projectId = searchParams.get("projectId");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [links, setLinks] = useState<SubmissionLink[]>([]);
    const [newLink, setNewLink] = useState({ type: "figma", url: "", label: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const linkTypes = [
        { value: "figma", label: "Figma" },
        { value: "drive", label: "Google Drive" },
        { value: "github", label: "GitHub" },
        { value: "behance", label: "Behance" },
        { value: "other", label: "Other" },
    ];

    const addLink = () => {
        if (!newLink.url || !newLink.label) {
            toast.error("Please provide both URL and label");
            return;
        }

        // Basic URL validation
        try {
            new URL(newLink.url);
        } catch {
            toast.error("Please provide a valid URL");
            return;
        }

        setLinks([...links, newLink as SubmissionLink]);
        setNewLink({ type: "figma", url: "", label: "" });
    };

    const removeLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!applicationId || !projectId) {
            toast.error("Missing application or project information");
            return;
        }

        if (!title.trim()) {
            toast.error("Please provide a title");
            return;
        }

        if (links.length === 0) {
            toast.error("Please add at least one submission link");
            return;
        }

        setIsSubmitting(true);

        const result = await createSubmission({
            application_id: parseInt(applicationId),
            project_id: parseInt(projectId),
            title: title.trim(),
            description: description.trim(),
            submission_links: links,
        });

        if (result.success) {
            toast.success("Submission created successfully!");
            router.push("/freelancer/submissions");
        } else {
            toast.error(result.error || "Failed to create submission");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                                T
                            </div>
                            <h1 className="text-xl font-bold text-foreground">TalentHub</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/freelancer/dashboard">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/freelancer/applications">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Applications
                                </Button>
                            </Link>
                            <Link href="/freelancer/submissions">
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    My Submissions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">
                        Submit Your Design
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Share your design prototype or solution for this project
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="p-6 space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Submission Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g., Modern E-commerce Redesign Concept"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your design approach, key features, and any important details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Explain your design decisions and how they solve the project requirements
                            </p>
                        </div>

                        {/* Links Section */}
                        <div className="space-y-4">
                            <div>
                                <Label>
                                    Design Links <span className="text-red-500">*</span>
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Add links to your Figma designs, prototypes, or other resources
                                </p>
                            </div>

                            {/* Added Links */}
                            {links.length > 0 && (
                                <div className="space-y-2">
                                    {links.map((link, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                                        {link.type}
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {link.label}
                                                    </span>
                                                </div>
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {link.url}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLink(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Link */}
                            <Card className="p-4 bg-muted/50">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="linkType" className="text-xs">
                                                Type
                                            </Label>
                                            <Select
                                                value={newLink.type}
                                                onValueChange={(value) =>
                                                    setNewLink({ ...newLink, type: value })
                                                }
                                            >
                                                <SelectTrigger id="linkType">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {linkTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="linkLabel" className="text-xs">
                                                Label
                                            </Label>
                                            <Input
                                                id="linkLabel"
                                                placeholder="e.g., Main Design File"
                                                value={newLink.label}
                                                onChange={(e) =>
                                                    setNewLink({ ...newLink, label: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="linkUrl" className="text-xs">
                                            URL
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="linkUrl"
                                                type="url"
                                                placeholder="https://..."
                                                value={newLink.url}
                                                onChange={(e) =>
                                                    setNewLink({ ...newLink, url: e.target.value })
                                                }
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                onClick={addLink}
                                                size="sm"
                                                className="shrink-0"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Link
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                        Submission Guidelines
                                    </p>
                                    <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                        <li>• Ensure all links are publicly accessible</li>
                                        <li>• For Figma, share with "Anyone with the link can view"</li>
                                        <li>• Include a clear description of your design approach</li>
                                        <li>• You can edit your submission before the deadline</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || links.length === 0}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Design"
                                )}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
}

export default function CreateSubmissionPage() {
    return (
        <Suspense fallback={null}>
            <CreateSubmissionContent />
        </Suspense>
    );
}
