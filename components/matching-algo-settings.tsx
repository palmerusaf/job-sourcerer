import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from '@/components/ui/field';
import { useMatchingAlgoSettings } from '@/hooks/useMatchingAlgoSettings';
import { toast } from 'sonner';

export function MatchingAlgoSettings() {
  const { settings, updateSettings } = useMatchingAlgoSettings();

  return (
    <Card className='flex flex-col items-center mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>
          <div className='text-xl'>Matching Settings</div>
        </CardTitle>
      </CardHeader>
      {(settings !== null && (
        <CardContent className='flex flex-col gap-2 px-12 w-full'>
          <FieldGroup>
            <Field>
              <FieldContent>
                <div className='flex gap-2 justify-center items-center w-full'>
                  <Switch
                    id='enable-sbert'
                    defaultChecked={settings.enableSbert}
                    onCheckedChange={async (checked) => {
                      await updateSettings({
                        enableSbert: checked,
                        keywordStrategy: settings.keywordStrategy,
                      });
                      toast.success('SBERT settings updated');
                    }}
                  />
                  <label
                    className='text-lg font-bold cursor-pointer select-none'
                    htmlFor='enable-sbert'
                  >
                    Enable SBERT
                  </label>
                </div>
              </FieldContent>
              <FieldDescription>
                Enable SBERT to improve resume matching using sentence
                embeddings. You can read more{' '}
                <a
                  href='https://www.sbert.net/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline'
                >
                  here
                </a>
                .
              </FieldDescription>
            </Field>
            <Field>
              <div className='flex justify-center'>
                <FieldLabel className='text-lg font-bold'>
                  Keyword Matching Strategy
                </FieldLabel>
              </div>
              <FieldContent>
                <div className='flex gap-4 justify-center'>
                  <div className='flex gap-2 items-center'>
                    <div className='flex items-center'>
                      <input
                        type='radio'
                        name='keyword-strategy'
                        id='keyword-strategy-idf-tf'
                        value='idf-tf'
                        defaultChecked={settings.keywordStrategy === 'idf-tf'}
                        onChange={async (e) => {
                          await updateSettings({
                            enableSbert: settings.enableSbert,
                            keywordStrategy: e.target.value as
                              | 'idf-tf'
                              | 'hardcoded',
                          });
                          toast.success(
                            'IDF-TF selected - Using statistical term weighting with TF-IDF scoring'
                          );
                        }}
                        className='text-primary focus:ring-primary'
                      />
                    </div>
                    <label
                      htmlFor='keyword-strategy-idf-tf'
                      className='text-sm font-medium cursor-pointer'
                    >
                      IDF-TF
                    </label>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <div className='flex items-center'>
                      <input
                        type='radio'
                        id='keyword-strategy-hardcoded'
                        name='keyword-strategy'
                        value='hardcoded'
                        defaultChecked={
                          settings.keywordStrategy === 'hardcoded'
                        }
                        onChange={async (e) => {
                          await updateSettings({
                            enableSbert: settings.enableSbert,
                            keywordStrategy: e.target.value as
                              | 'idf-tf'
                              | 'hardcoded',
                          });
                          toast.success(
                            'Hardcoded Keywords selected - Using predefined important keywords with boosted weights'
                          );
                        }}
                        className='text-primary focus:ring-primary'
                      />
                    </div>
                    <label
                      htmlFor='keyword-strategy-hardcoded'
                      className='text-sm font-medium cursor-pointer'
                    >
                      Hardcoded Keywords
                    </label>
                  </div>
                </div>
              </FieldContent>
              <FieldDescription>
                Choose between statistical term weighting (IDF-TF) or predefined
                keyword matching.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      )) || <div className='py-4'>Loading...</div>}
    </Card>
  );
}
