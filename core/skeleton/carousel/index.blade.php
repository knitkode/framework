@props([
  // main configurable props:
  'width'=> 300,
  'height' => 200,
  'quantity' => 8,
  'lines' => 0,
  'gutter' => 15,
  'startColor' => '#f3f3f3',
  'endColor' => '#ecebeb',
  'speed' => '2s',
  'radius' => 0,
  // other configurable props:
  'classSvg' => '',
  'textHeight' => 14,
  'texGutterY' => 4,
  'imgHeight' => null,
  'imgGutterY' => null,
])

@php
  // constants
  $_id = uniqid('async');
  // computed props:
  $_imgHeight = $imgHeight ?? $height;
  $_imgGutterY = $imgGutterY ?? $gutter;
  $_textAllHeight = ($_textHeight * $lines) + ($_texGutterY * ($lines - 1));
  $_fullWidth =  ($width * $quantity) + ($gutter * $quantity);
  $_fullHeight = $lines == 0 ? $_imgHeight : $_imgHeight + $_imgGutterY + $_textAllHeight;
@endphp

<div {{ $attributes->merge(['class' => 'skeletonCarousel']) }}>
  <svg
    class="skeletonCarouselsvg {{ $classSvg }}"
    role="img"
    viewBox="0 0 {{ $_fullWidth }} {{ $_fullHeight }}" 
    preserveAspectRatio="none"
  >
    <rect clip-path="url(#{{ $_id }}-clip-path)" style='fill: url("#{{ $_id }}-fill");' x="0" y="0" width="100%" height="100%"></rect>
    <defs>
      <clipPath id="{{ $_id }}-clip-path">
        @for ($i = 0; $i < $quantity; $i++)
          <rect 
            rx="{{ $radius }}"
            ry="{{ $radius }}"
            y="0"
            x="{{ ($width * $i) + ($gutter * $i) }}" 
            width="{{ $width }}" 
            height="{{ $_imgHeight }}"
            {{-- height="100%" --}}
          />
          @if($lines > 0)
            @for ($j = 1; $j < $lines + 1; $j++)
            <rect rx="{{ $radius }}" ry="{{ $radius }}"
              y="{{ $_imgHeight + $gutter + ($_textHeight * ($j - 1)) + ($_texGutterY * ($j - 1)) }}"
              x="{{ ($width * $i) + ($gutter * $i) }}" 
              width="{{ $width / $j }}" height="{{ $_textHeight }}"
            />
            @endfor
          @endif
        @endfor
      </clipPath>
      <linearGradient id="{{ $_id }}-fill">
        <stop stop-color="{{ $_startColor }}" offset="0.599964" stop-opacity="1">
          <animate dur="{{ $_speed }}" attributeName="offset" values="-2; -2; 1" keyTimes="0; 0.25; 1" repeatCount="indefinite"></animate>
        </stop>
        <stop stop-color="{{ $_endColor }}" offset="1.59996" stop-opacity="1">
          <animate dur="{{ $_speed }}" attributeName="offset" values="-1; -1; 2" keyTimes="0; 0.25; 1" repeatCount="indefinite"></animate>
        </stop>
        <stop stop-color="{{ $_startColor }}" offset="2.59996" stop-opacity="1">
          <animate dur="{{ $_speed }}" attributeName="offset" values="0; 0; 3" keyTimes="0; 0.25; 1" repeatCount="indefinite"></animate>
        </stop>
      </linearGradient>
    </defs>
  </svg>
</div>
