@props([
  'tabParam' => 'tab',
  'tag' => 'div'
])

@php
  $_classes = 'tabs' . (request()->query($tabParam) ? ' has-active' : '');
@endphp

<{{ $tag }} {{ $attributes->merge(['class' => $_classes]) }} data-tabs="{{ $tabParam }}">
  {{ $slot ?? ''}}
</{{ $tag }}> 
