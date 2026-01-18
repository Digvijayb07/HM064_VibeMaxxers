# API Documentation

## Server Actions

TalentHub uses Next.js Server Actions for all backend operations. All actions are located in the `lib/` directory.

---

## Application Actions

**File:** `lib/application-actions.ts`

### `shortlistApplication(applicationId, submissionDeadline?)`

Shortlist an application and set submission deadline.

**Parameters:**
- `applicationId` (number) - The application ID
- `submissionDeadline` (string, optional) - ISO date string, defaults to 7 days from now

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  data?: Application;
}
```

**Example:**
```typescript
const result = await shortlistApplication(123);
if (result.success) {
  toast.success('Application shortlisted!');
}
```

---

### `rejectApplication(applicationId)`

Reject an application.

**Parameters:**
- `applicationId` (number) - The application ID

**Returns:** `ShortlistResult`

---

### `bulkShortlist(applicationIds, submissionDeadline?)`

Shortlist multiple applications at once.

**Parameters:**
- `applicationIds` (number[]) - Array of application IDs
- `submissionDeadline` (string, optional) - ISO date string

**Returns:** `ShortlistResult`

---

### `bulkReject(applicationIds)`

Reject multiple applications at once.

**Parameters:**
- `applicationIds` (number[]) - Array of application IDs

**Returns:** `ShortlistResult`

---

### `getApplicationsByProject(projectId)`

Get all applications for a specific project.

**Parameters:**
- `projectId` (number) - The project ID

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  data?: Application[];
}
```

---

### `getApplicationsByFreelancer(userId)`

Get all applications submitted by a freelancer.

**Parameters:**
- `userId` (string) - The user ID

**Returns:** Application list result

---

## Submission Actions

**File:** `lib/submission-actions.ts`

### `createSubmission(data)`

Create a new design submission.

**Parameters:**
```typescript
{
  application_id: number;
  project_id: number;
  title: string;
  description: string;
  submission_links: SubmissionLink[];
  deadline?: string;
}
```

**Returns:** `SubmissionResult`

**Example:**
```typescript
const result = await createSubmission({
  application_id: 123,
  project_id: 456,
  title: "Mobile App Design",
  description: "Modern UI/UX design for iOS app",
  submission_links: [
    {
      type: 'figma',
      url: 'https://figma.com/file/...',
      label: 'Main Design File'
    }
  ]
});
```

---

### `updateSubmission(submissionId, data)`

Update an existing submission (before deadline).

**Parameters:**
- `submissionId` (string) - The submission ID
- `data` (UpdateSubmissionData) - Fields to update

**Returns:** `SubmissionResult`

---

### `deleteSubmission(submissionId)`

Delete a submission (before deadline).

**Parameters:**
- `submissionId` (string) - The submission ID

**Returns:** `SubmissionResult`

---

### `rateSubmission(submissionId, rating, feedback?)`

Rate a submission (company only).

**Parameters:**
- `submissionId` (string) - The submission ID
- `rating` (number) - Rating from 1 to 5
- `feedback` (string, optional) - Feedback text

**Returns:** `SubmissionResult`

---

### `selectWinner(submissionId)`

Select a submission as winner. Automatically:
- Marks submission as selected
- Updates application to awarded
- Rejects other submissions
- Creates winner compensation
- Creates participation compensations

**Parameters:**
- `submissionId` (string) - The winning submission ID

**Returns:** `SubmissionResult`

---

### `getSubmissionsByProject(projectId)`

Get all submissions for a project (company only).

**Parameters:**
- `projectId` (number) - The project ID

**Returns:** Submission list result

---

### `getSubmissionsByFreelancer(userId)`

Get all submissions by a freelancer.

**Parameters:**
- `userId` (string) - The user ID

**Returns:** Submission list result

---

## Compensation Actions

**File:** `lib/compensation-actions.ts`

### `approveCompensations(compensationIds)`

Approve one or more compensations.

**Parameters:**
- `compensationIds` (string[]) - Array of compensation IDs

**Returns:** `CompensationResult`

**Example:**
```typescript
const result = await approveCompensations([id1, id2, id3]);
if (result.success) {
  toast.success(`${compensationIds.length} compensations approved!`);
}
```

---

### `markAsPaid(compensationId)`

Mark a compensation as paid.

**Parameters:**
- `compensationId` (string) - The compensation ID

**Returns:** `CompensationResult`

---

### `getCompensationsByProject(projectId)`

Get all compensations for a project.

**Parameters:**
- `projectId` (number) - The project ID

**Returns:** Compensation list result

---

### `getCompensationsByUser(userId)`

Get all compensations for a user (freelancer earnings).

**Parameters:**
- `userId` (string) - The user ID

**Returns:** Compensation list result

---

### `getProjectSettings(projectId)`

Get or create project settings.

**Parameters:**
- `projectId` (number) - The project ID

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  data?: ProjectSettings;
}
```

---

### `updateProjectSettings(projectId, settings)`

Update project compensation settings.

**Parameters:**
- `projectId` (number) - The project ID
- `settings` - Settings object:
  ```typescript
  {
    participation_compensation?: number;
    winner_compensation?: number;
    auto_approve_participation?: boolean;
  }
  ```

**Returns:** `CompensationResult`

---

## Error Handling

All server actions return a consistent result format:

```typescript
{
  success: boolean;
  error?: string;
  data?: any;
}
```

**Example usage:**
```typescript
const result = await someAction(params);

if (result.success) {
  // Handle success
  toast.success('Operation successful!');
  router.refresh();
} else {
  // Handle error
  toast.error(result.error || 'Something went wrong');
}
```

---

## Authentication

All server actions automatically check authentication using Supabase:

```typescript
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return { success: false, error: 'Not authenticated' };
}
```

---

## Authorization

Actions verify that users have permission to perform operations:

```typescript
// Example: Verify project ownership
const { data: project } = await supabase
  .from('projects')
  .select('company_id')
  .eq('id', projectId)
  .single();

if (project.company_id !== user.id) {
  return { success: false, error: 'Unauthorized' };
}
```

---

## Cache Revalidation

Server actions use `revalidatePath` to update cached data:

```typescript
import { revalidatePath } from 'next/cache';

// After successful operation
revalidatePath('/company/applications');
revalidatePath('/freelancer/applications');
```

---

## Type Safety

All actions use TypeScript types defined in `lib/types.ts`:

```typescript
import type { Application, Submission, Compensation } from '@/lib/types';
```

---

For more information, see the source code in the `lib/` directory.
