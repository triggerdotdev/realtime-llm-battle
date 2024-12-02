## Trigger.dev Realtime streams Demo

https://github.com/user-attachments/assets/a6ad8ca4-b1d2-4fee-b018-722a248b6353

This demo shows off a variety of features of [Trigger.dev Realtime streams](https://trigger.dev/docs/realtime) and using our React hooks to trigger tasks from the frontend.

## Getting Started

Copy the `.env.local.example` file to `.env.local` and fill in the values for the various services, including Trigger.dev.

If you haven't already, create a project on Trigger.dev and copy the project ref into the `trigger.config.ts` file.

Then, run the Next.js development server and the Trigger.dev dev CLI command in a separate terminal.

```bash
npm install
npm run dev
npm run dev:trigger # Run this in a separate terminal
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## AI SDK + Realtime streams + frontend triggering

- View the Trigger.dev task code in the [src/trigger/ai.ts](src/trigger/ai.ts) file.
- View the frontend code in the [src/components/AppUI.tsx](src/components/AppUI.tsx) file.

## Learn More

To learn more about Trigger.dev Realtime, take a look at the following resources:

- [Trigger.dev Documentation](https://trigger.dev/docs) - learn about Trigger.dev and its features.
- [Realtime docs](https://trigger.dev/docs/realtime) - learn about the Realtime feature of Trigger.dev.
- [React hooks](https://trigger.dev/docs/frontend/react-hooks) - learn about the React hooks provided by Trigger.dev.
