@props([
  'data' => [],
  'routeData' => [], // the CmsApi data, overridable from a route controller
])
@php
  $routeDataLayer = isset($routeData['analytics']) ? $routeData['analytics']['dataLayer'] ?? [] : [];
  $dataLayer= array_merge($data, $routeDataLayer);
@endphp
<script>window.dataLayer = window.dataLayer || @json($dataLayer)</script>
