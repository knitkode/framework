@props([
  'tag' => 'li',
])
<{{ $tag }} {{ $attributes->merge(['class' => 'glide__slide']) }}>
  {{ $slot ?? '' }}
</{{ $tag }}>
