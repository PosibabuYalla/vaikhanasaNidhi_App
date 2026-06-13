const TITHIS = [
  'పాడ్యమి','విదియ','తదియ','చవితి','పంచమి',
  'షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి',
  'ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','పౌర్ణమి/అమావాస్య'
];

const NAKSHATRAS = [
  'అశ్విని','భరణి','కృత్తిక','రోహిణి','మృగశిర',
  'ఆర్ద్ర','పునర్వసు','పుష్యమి','ఆశ్లేష','మఖ',
  'పూర్వఫల్గుణి','ఉత్తరఫల్గుణి','హస్త','చిత్త','స్వాతి',
  'విశాఖ','అనురాధ','జ్యేష్ఠ','మూల','పూర్వాషాఢ',
  'ఉత్తరాషాఢ','శ్రవణం','ధనిష్ఠ','శతభిష','పూర్వభాద్ర',
  'ఉత్తరభాద్ర','రేవతి'
];

const RAHUKALAMS = [
  '07:30 - 09:00', // Sunday
  '07:30 - 09:00', // Monday
  '15:00 - 16:30', // Tuesday
  '12:00 - 13:30', // Wednesday
  '13:30 - 15:00', // Thursday
  '10:30 - 12:00', // Friday
  '09:00 - 10:30', // Saturday
];

const YAMAGANDAM = [
  '12:00 - 13:30',
  '10:30 - 12:00',
  '09:00 - 10:30',
  '07:30 - 09:00',
  '06:00 - 07:30',
  '15:00 - 16:30',
  '13:30 - 15:00',
];

const AUSPICIOUS = [
  'అభిజిత్ ముహూర్తం: 11:48 - 12:36',
  'బ్రహ్మ ముహూర్తం: 04:30 - 05:18',
  'విజయ ముహూర్తం: 14:12 - 15:00',
  'అభిజిత్ ముహూర్తం: 11:42 - 12:30',
  'బ్రహ్మ ముహూర్తం: 04:24 - 05:12',
  'గోధూళి ముహూర్తం: 18:12 - 18:36',
  'అభిజిత్ ముహూర్తం: 11:54 - 12:42',
];

const DAYS_TE = ['ఆదివారం','సోమవారం','మంగళవారం','బుధవారం','గురువారం','శుక్రవారం','శనివారం'];

const MONTHS_TE = [
  'జనవరి','ఫిబ్రవరి','మార్చి','ఏప్రిల్','మే','జూన్',
  'జూలై','ఆగస్టు','సెప్టెంబర్','అక్టోబర్','నవంబర్','డిసెంబర్'
];

export function getPanchangamForDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const dateNum = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  const tithiIdx = (dateNum + month * 3) % 15;
  const nakshatraIdx = (dateNum + month * 2 + day) % 27;

  return {
    dateLabel: `${dateNum} ${MONTHS_TE[month]} ${year}`,
    day: DAYS_TE[day],
    tithi: TITHIS[tithiIdx],
    nakshatra: NAKSHATRAS[nakshatraIdx],
    rahukalam: RAHUKALAMS[day],
    yamagandam: YAMAGANDAM[day],
    sunrise: '06:02',
    sunset: '18:45',
    auspicious: AUSPICIOUS[day],
  };
}
