@props([
  'tabParam' => 'tab',
  'tag' => 'div'
])

@php
  $_classes = 'tabsPanels' . (request()->query($tabParam) ? ' has-active' : '');
@endphp

<{{ $tag }} {{ $attributes->merge(['class' => $_classes]) }} data-tabs-panels="{{ $tabParam }}">
  {{ $slot ?? ''}}
</{{ $tag }}> 
