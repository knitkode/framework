@props([
  'name' => '_timezone_offset',
  'value' => null
])
@php
  $_value = $value ?? $user[$name] ?? '';
@endphp
<input data-auth-timezone-offset type="hidden" name="{{ $name }}" value="{{ $_value }}">
