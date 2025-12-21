import * as Card from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { JSX, useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  useEffect(() => {
    if (!('theme' in localStorage)) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    localStorage.theme = isDark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  return { isDark, setIsDark };
}

export function DisplaySettings(): JSX.Element {
  const { isDark, setIsDark } = useDarkMode();

  return (
    <Card.Card className='flex flex-col items-center mx-auto w-full max-w-2xl'>
      <Card.CardHeader>
        <Card.CardTitle>
          <div className='text-xl'>Display Settings</div>
        </Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent className='flex gap-2'>
        <Switch
          id='airplane-mode'
          checked={isDark}
          onCheckedChange={(e: {
            valueOf: () => boolean | ((prevState: boolean) => boolean);
          }) => setIsDark(e.valueOf())}
        />
        <label htmlFor='airplane-mode'>Dark Mode</label>
      </Card.CardContent>
    </Card.Card>
  );
}
