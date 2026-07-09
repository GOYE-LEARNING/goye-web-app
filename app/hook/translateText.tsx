// components/TranslatedText.tsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/checkLanguages';

interface Props {
  text: string;
  className?: string;
  fallbackText?: string;
}

export default function TranslatedText({ text, className = '', fallbackText }: Props) {
  const [translated, setTranslated] = useState<string>(text);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { translate, hasLanguage, languageCode } = useLanguage();

  useEffect(() => {
    const translateText = async () => {
      // If no language selected or language is English, show original
      if (!hasLanguage || languageCode === 'en') {
        setTranslated(text);
        return;
      }

      setIsLoading(true);
      try {
        const result = await translate(text);
        setTranslated(result);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslated(fallbackText || text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, hasLanguage, languageCode, translate, fallbackText]);

  if (isLoading) {
    return <span className={`${className}`}>{text}</span>;
  }

  return <span className={className}>{translated}</span>;
}