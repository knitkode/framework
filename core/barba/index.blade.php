@props([
  'namespace' => $route
])

<div {{ $attributes->merge(['class' => 'barba:wrapper']) }} data-barba="wrapper">
  {{ $above ?? '' }}
  <div class="barba:container" data-barba="container" data-barba-namespace="{{ $namespace }}">
    {{ $slot }}
  </div>
  {{ $below ?? '' }}
</div>
