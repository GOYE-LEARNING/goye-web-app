// hooks/useTranslation.ts
import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/checkLanguages';

export function useTranslation(text: string) {
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { translate, hasLanguage, languageCode } = useLanguage();

  useEffect(() => {
    const translateText = async () => {
      if (!hasLanguage || languageCode === 'en') {
        setTranslatedText(text);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const result = await translate(text);
        setTranslatedText(result);
      } catch (err) {
        setError(err as Error);
        setTranslatedText(text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, hasLanguage, languageCode, translate]);

  return { translatedText, isLoading, error };
}