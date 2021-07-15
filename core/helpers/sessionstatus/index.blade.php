@props([
  'namespace' => '', // required
  'type' => '', // optional
])
@php
  $_value = session($namespace.'_status');
  $_msg = '';
  $_ofRightType = true;
  $_class = '';

  if (strpos($_value, '[raw]') !== false) {
    $_msg = str_replace('[raw]', '', $_value);

    $_regexMsgKey = '/\[key=(.+)]/m';
    preg_match_all($_regexMsgKey, $_value, $matches, PREG_SET_ORDER, 0);
    $typeFromKey = $matches[0][1];
    $keyToReplace = $matches[0][0];

    $_class = 'is-' . str_replace('.', '-', $typeFromKey);

    if ($matches[0]) {
      // allow to scope the status message based on the `type`
      if ($type) {
        $_ofRightType = strpos($_value, $typeFromKey) !== false;
      }
      
      $_msg = str_replace($keyToReplace, '', $_msg);
    }

  } else {
    // allow to scope the status message based on the `type`
    if ($type) {
      $_ofRightType = strpos($_value, ".$type") !== false;
    }

    $_class = str_replace($namespace, '', $_value);
    $_class = 'is-' . str_replace('.', '-', $_class);
  }
@endphp
@if(($_value || $_msg) && $_ofRightType)
  <div class="sessionStatus {{ $_class }}">
    {{ $trans[$namespace.'.'.$_value] ?? $_msg }}
  </div>
@endif
