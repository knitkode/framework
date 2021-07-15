@props([
  'prerendered' => false,
  'in' => false,
  'backdrop' => true,
])

@php
  $className = 'dialog';
  if ($prerendered) $className .= ' is-prerendered';
  if ($in) $className .= ' is-in';
@endphp

<div {{ $attributes->merge(['class' => $className]) }}>
  @if($backdrop)<div class="dialogBackdrop"></div>@endif
  <div class="dialogCage" data-dialog-close>
    <div class="dialogCenterer" data-dialog-close>
      <div class="dialogWrap">
        <div class="dialogContent">
          {{ $slot ?? '' }}
        </div>
        @isset($loader)
          <div class="dialogLoader">
            {{ $loader }}
          </div>
        @endisset
      </div>
    </div>
  </div>
</div>
