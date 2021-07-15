@props([
  'btnClass' => ''
])
<div {{ $attributes->merge(['class' => 'glide__controls']) }} data-glide-el="controls">
  @isset($prev) {{ $prev }}@else<button class="{{ $btnClass }} glide-prev" data-glide-dir="<"></button>@endisset
  @isset($next) {{ $next }}@else<button class="{{ $btnClass }} glide-next" data-glide-dir=">"></button>@endisset
</div>
