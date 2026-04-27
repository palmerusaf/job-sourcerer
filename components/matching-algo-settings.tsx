import * as Card from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { JSX } from 'react';

export function MatchingAlgoSettings(): JSX.Element {
  return (
    <Card.Card className='flex flex-col items-center mx-auto w-full max-w-2xl'>
      <Card.CardHeader>
        <Card.CardTitle>
          <div className='text-xl'>Matching Settings</div>
        </Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent className='flex flex-col gap-2 px-12 w-full'>
        <div className='flex gap-2 justify-center items-center w-full'>
          <Switch id='airplane-mode' onCheckedChange={console.log} />
          <label
            className='text-lg font-bold cursor-pointer select-none'
            htmlFor='airplane-mode'
          >
            Enable SBERT
          </label>
        </div>
        <p>
          *SBERT is a machine learning algorithm that can compare document
          senteces. This will improve the resume matching score at the expense
          of performance. You can read more <a href=''>here</a>.
        </p>
      </Card.CardContent>
    </Card.Card>
  );
}
