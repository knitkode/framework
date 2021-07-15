@props([
  'size' => 48,
  'color' => '#a2a1a1',
  'thickness' => 1,
  'center' => false,
])
@php $size_half = $size / 2; @endphp
<svg class="progress progressCircular"
  @if($center) style="margin-left: -{{ $size_half }}px; margin-top: -{{ $size_half }}px"@endif
  width="{{ $size }}px" height="{{ $size }}px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {{ $size }} {{ $size }}" preserveAspectRatio="xMidYMid">
    <circle class="progressShape progressCirculaCircle"
      cx="{{ $size_half }}" cy="{{ $size_half}}" r="{{ $size / 3 }}" stroke-dasharray="{{ $size_half }} {{ $size_half }}" transform="rotate(88.7411 {{ $size }} {{ $size }})"
      stroke="{{ $color }}" fill="none" stroke-linecap="round" stroke-width="{{ $thickness }}">
      <animateTransform values="0 {{ $size_half }} {{ $size_half }};360 {{ $size_half }} {{ $size_half }}"
        attributeName="transform" type="rotate" calcMode="linear" keyTimes="0;1" dur="1s"  begin="0s" repeatCount="indefinite"></animateTransform>
    </circle>
</svg>
