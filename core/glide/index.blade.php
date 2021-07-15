@props([
  'tagSlides' => 'ul'
])
<div {{ $attributes->merge(['class' => 'glide']) }}>
  {{ $above ?? '' }}
  <div class="glide__track" data-glide-el="track">
    <{{ $tagSlides }} class="glide__slides">
      {{ $slot ?? '' }}
    </{{ $tagSlides }}>
  </div>
  {{ $below ?? '' }}
</div>
