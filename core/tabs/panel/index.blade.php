@props([
  'tabId' => '',
  'tabParam' => 'tab',
  'tag' => 'div'
])

@php
  $_isActive = request()->query($tabParam) === $tabId;
  $_classes = 'tabsPanel' . ($_isActive ? ' is-active' : '');
@endphp

<{{ $tag }} {{ $attributes->merge(['class' => $_classes]) }} data-tabs-panel="{{ $tabId }}" data-tabs="{{ $tabParam }}">
  {{ $slot }}
</{{ $tag }}> 
