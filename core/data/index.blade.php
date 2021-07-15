@props([
  'key' => 'defaultKey',
  'value' => [],
])
<script>
  window.__DATA = window.__DATA || {};
  window["__DATA"]['{{ $key }}'] = @json($value);
</script>
