@props([
  // main configurable props:
  'width' => 210,
  'lines' => 3,
  'circle' => true,
  'gutterX' => 15,
  'startColor' => '#f3f3f3',
  'endColor' => '#ecebeb',
  'speed' => '2s',
  'radius' => 0,
  // other configurable props:
  'classSvg' => '',
  'circleRadius' => 8,
  'textHeight' => 14,
  'gutterY' => 8,
])

@php
  // constants
  $_id = uniqid('async');
  // computed props:
  $_textWidth = $width - ($circleRadius * 2) - $gutterX;
  $_lineFullHeight = max($textHeight, ($circleRadius * 2));
  $_circleOffsetY = (($_lineFullHeight - ($circleRadius * 2)) / 2) + $circleRadius;
  $_textOffsetY = ($_lineFullHeight - $textHeight) / 2;
  $_textOffsetX = $circle ? ($circleRadius * 2) + $gutterX : 0;
  $_fullHeight = ($lines * $_lineFullHeight) + (($lines - 1) * $gutterY);
@endphp

<div {{ $attributes->merge(['class' => 'skeletonList']) }}>
  <svg
    class="skeletonListSvg {{ $classSvg }}"
    role="img"
    viewBox="0 0 {{ $width }} {{ $_fullHeight }}" 
    preserveAspectRatio="none"
  >
    <rect clip-path="url(#{{ $_id }}-clip-path)" style='fill: url("#{{ $_id }}-fill");' x="0" y="0" width="100%" height="100%"></rect>
    <defs>
      <clipPath id="{{ $_id }}-clip-path">
        @for ($i = 0; $i < $lines; $i++)
          @if ($circle)
            <circle 
              cx="{{ $circleRadius }}" 
              cy="{{ ($i * $_lineFullHeight) + ($i * $gutterY) + $_circleOffsetY }}" 
              r="{{ $circleRadius }}"
            /> 
          @endif
          <rect 
            rx="{{ $radius }}"
            ry="{{ $radius }}"
            x="{{ $_textOffsetX }}" 
            y="{{ ($i * $_lineFullHeight) + ($i * $gutterY) + $_textOffsetY }}"
            width="{{ $_textWidth }}" 
            height="{{ $textHeight }}"
          />
        @endfor
      </clipPath>
      <linearGradient id="{{ $_id }}-fill">
        <stop stop-color="{{ $startColor }}" offset="0.599964" stop-opacity="1">
          <animate dur="{{ $speed }}" attributeName="offset" values="-2; -2; 1" keyTimes="0; 0.25; 1" repeatCount="indefinite"></animate>
        </stop>
        <stop stop-color="{{ $endColor }}" offset="1.59996" stop-opacity="1">
          <animate dur="{{ $speed }}" attributeName="offset" values="-1; -1; 2" keyTimes="0; 0.25; 1" repeatCount="indefinite"></animate>
        </stop>
        <stop stop-color="{{ $startColor }}" offset="2.59996" stop-opacity="1">
          <animate dur="{{ $speed }}" attributeName="offset" values="0; 0; 3" keyTimes="0; 0.25; 1" repeatCount="indefinite"></animate>
        </stop>
      </linearGradient>
    </defs>
  </svg>
</div>