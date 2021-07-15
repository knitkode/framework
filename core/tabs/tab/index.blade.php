@props([
  'tabId' => '',
  'tabParam' => 'tab',
  'tag' => 'a'
])

@php
  $_isActive = request()->query($tabParam) === $tabId;
  $_classes = 'tabsTab' . ($_isActive ? ' is-active' : '');
  $_link = request()->fullUrlWithQuery([ $tabParam => $tabId ])
@endphp

<{{ $tag }} {{ $attributes->merge(['class' => $_classes]) }}@if($tag === 'a') href="{{ $_link }}"@endif data-tabs-tab="{{ $tabId }}" data-tabs="{{ $tabParam }}">
  {{ $slot }}
</{{ $tag }}> 
