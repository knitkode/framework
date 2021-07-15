@props([
  'classContainer' => 'container-lg',
  'classBtn' => 'btn',
  'privacyRoute' => 'privacy',
  'privacyLink' => null,
  'keyText' => 'cookies.text',
  'keyOk' => 'cookies.ok'
])
@php
  $_link = $privacyLink ??  to($privacyRoute);
@endphp
<div id="cookiesBanner" class="cookies">
  <div class="cookiesContainer {{ $classContainer }}">
    <div class="cookiesInner">
      <div class="cookiesText">
        {!! str_replace('<a>', '<a href="'.$_link.'" target="_blank" rel="noopener">', $trans[$keyText] ) !!}
      </div>
      <div class="cookiesActions">
        <span class="cookiesAccept {{ $classBtn }}">
          {!! $trans[$keyOk] !!}
        </span>
      </div>
    </div>
  </div>
</div>
