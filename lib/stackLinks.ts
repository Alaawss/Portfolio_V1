// Official website of each tool. The home page's "Modern Tech Stack" grid (components/sections/TechStack.tsx)
// links every tile to its site from here, so the names must match lib/techStackData.ts. The list also covers
// the rest of the projects' stacks, ready if a tool is added to the grid.
export const stackLinks: Record<string, string> = {
  // Web
  'Next.js': 'https://nextjs.org',
  'React': 'https://react.dev',
  'TypeScript': 'https://www.typescriptlang.org',
  'Vite': 'https://vite.dev',
  'Tailwind CSS': 'https://tailwindcss.com',
  'React Router': 'https://reactrouter.com',
  'Framer Motion': 'https://motion.dev', // Framer Motion is now called Motion
  'Motion': 'https://motion.dev',
  'GSAP': 'https://gsap.com',
  'Recharts': 'https://recharts.org',
  'i18next': 'https://www.i18next.com',
  'PapaParse': 'https://www.papaparse.com',
  'React Query': 'https://tanstack.com/query',
  'Zustand': 'https://zustand.docs.pmnd.rs',
  'React Hook Form': 'https://react-hook-form.com',
  'Zod': 'https://zod.dev',

  // Mobile
  'React Native': 'https://reactnative.dev',
  'Expo': 'https://expo.dev',
  'Expo Router': 'https://docs.expo.dev/router/introduction/',
  'NativeWind': 'https://www.nativewind.dev',
  'Reanimated': 'https://docs.swmansion.com/react-native-reanimated/',
  'Push notifications': 'https://docs.expo.dev/push-notifications/overview/', // EduLink sends them through Expo

  // Back end, services, tools
  'Node.js': 'https://nodejs.org',
  'Laravel': 'https://laravel.com',
  'Sanctum': 'https://laravel.com/docs/sanctum',
  'MySQL': 'https://www.mysql.com',
  'Supabase': 'https://supabase.com',
  'Paddle': 'https://www.paddle.com',
  'PostHog': 'https://posthog.com',
  'Resend': 'https://resend.com',
  'Vercel': 'https://vercel.com',
  'Azure': 'https://azure.microsoft.com',
  'Figma': 'https://www.figma.com',
};
