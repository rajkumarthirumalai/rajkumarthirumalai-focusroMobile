// Example of Localization in React Native Multi Language App
// https://aboutreact.com/localization-in-react-native/

import LocalizedStrings from 'react-native-localization';
import en from './en.json';
import ta from './ta.json';
import ar from './arabic.json';
import ca from './catalan.json';
import zh from './chinese.json';
import hi from './hindi.json';
import ru from './russian.json';
import es from './spanish.json';
import fr from './french.json';
import de from './german.json';

const StringsOfLanguages = new LocalizedStrings({
  en,
  ta,
  ar,
  ca,
  zh,
  hi,
  ru,
  es,
  fr,
  de,
});

export default StringsOfLanguages;
