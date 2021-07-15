@props([
  'text' => ''
])
<a {{ $attributes }} target="_blank" rel="noopener">{{ $slot ?? $text }}</a>