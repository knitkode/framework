<div {{ $attributes->merge(['class' => 'progressOverlay']) }}>
  {{ $slot ?? '' }}
</div>
