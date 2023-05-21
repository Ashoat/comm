// @flow

import * as React from 'react';

type Props = {
  +size?: number,
};

function SignalLogo(props: Props): React.Node {
  const { size } = props;

  return (
    <svg
      width={size ?? 50}
      height={size ?? 50}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.8967 3.9655L21.3867 5.95049C19.4553 6.42783 17.6067 7.19318 15.9032 8.22082L14.8548 6.46535C16.73 5.32978 18.7673 4.4868 20.8967 3.9655ZM31.3799 3.9655L30.8898 5.95049C32.8212 6.42783 34.6698 7.19318 36.3734 8.22082L37.4341 6.46535C35.554 5.33077 33.5127 4.48791 31.3799 3.9655ZM7.44214 13.8718C6.30763 15.7497 5.46475 17.789 4.9423 19.9198L6.92729 20.4099C7.40463 18.4785 8.16998 16.6299 9.19762 14.9264L7.44214 13.8718ZM6.3504 25.1614C6.35025 24.1689 6.4249 23.1777 6.57371 22.1964L4.5515 21.8862C4.22274 24.0553 4.22274 26.2614 4.5515 28.4305L6.57371 28.1265C6.42513 27.1452 6.35048 26.154 6.3504 25.1614ZM37.4217 43.8513L36.3734 42.1021C34.6725 43.1307 32.8258 43.8961 30.896 44.3724L31.3861 46.3574C33.5128 45.8311 35.5477 44.9862 37.4217 43.8513ZM45.9261 25.1614C45.9261 26.154 45.8514 27.1452 45.7028 28.1265L47.725 28.4305C48.0538 26.2614 48.0538 24.0553 47.725 21.8862L45.7028 22.1964C45.8516 23.1777 45.9263 24.1689 45.9261 25.1614ZM47.3342 30.3969L45.3493 29.9068C44.873 31.8405 44.1076 33.6913 43.0789 35.3965L44.8344 36.4511C45.97 34.5715 46.8129 32.5301 47.3342 30.3969ZM29.1033 44.726C27.1378 45.0238 25.1387 45.0238 23.1732 44.726L22.8692 46.7482C25.0362 47.077 27.2403 47.077 29.4073 46.7482L29.1033 44.726ZM42.0678 36.8977C40.8888 38.4965 39.4751 39.9081 37.8745 41.0848L39.0903 42.7348C40.8533 41.437 42.4129 39.8836 43.7178 38.1259L42.0678 36.8977ZM37.8745 9.23192C39.4752 10.4108 40.8889 11.8245 42.0678 13.4252L43.7178 12.197C42.4175 10.4377 40.862 8.8822 39.1027 7.5819L37.8745 9.23192ZM10.2087 13.4252C11.3876 11.8245 12.8013 10.4108 14.402 9.23192L13.1738 7.5819C11.4145 8.8822 9.859 10.4377 8.5587 12.197L10.2087 13.4252ZM44.8344 13.8718L43.0789 14.9264C44.1075 16.6272 44.8729 18.4739 45.3493 20.4037L47.3342 19.9136C46.8117 17.7847 45.9688 15.7475 44.8344 13.8718ZM23.1732 5.59691C25.1387 5.29913 27.1378 5.29913 29.1033 5.59691L29.4073 3.57471C27.2403 3.24591 25.0362 3.24591 22.8692 3.57471L23.1732 5.59691ZM11.257 43.2807L7.03274 44.2607L8.01903 40.0364L6.02784 39.5712L5.04155 43.7955C4.97983 44.0574 4.97036 44.3289 5.01368 44.5945C5.05699 44.8601 5.15223 45.1145 5.29396 45.3432C5.43569 45.5719 5.62112 45.7705 5.83965 45.9275C6.05818 46.0845 6.30551 46.1968 6.56751 46.2581C6.87391 46.3264 7.19157 46.3264 7.49797 46.2581L11.7223 45.2843L11.257 43.2807ZM6.44965 37.7475L8.44704 38.2065L9.12938 35.2787C8.13294 33.6072 7.39078 31.7968 6.92729 29.9068L4.9423 30.3969C5.38878 32.2059 6.06417 33.9506 6.9521 35.5888L6.44965 37.7475ZM16.0024 42.1765L13.0746 42.8589L13.5398 44.8562L15.6923 44.3538C17.3292 45.2444 19.0743 45.9199 20.8842 46.3636L21.3743 44.3786C19.4902 43.909 17.6862 43.1628 16.021 42.1641L16.0024 42.1765ZM26.1383 7.42062C16.3374 7.42682 8.40362 15.373 8.40362 25.1676C8.40902 28.5038 9.35267 31.7711 11.1268 34.5963L9.42093 41.8788L16.6972 40.1729C24.9907 45.3897 35.9454 42.9023 41.1622 34.615C46.379 26.3276 43.8977 15.373 35.6104 10.15C32.7733 8.36585 29.4897 7.41971 26.1383 7.42062Z"
        fill="#3A76F0"
      />
    </svg>
  );
}

export default SignalLogo;