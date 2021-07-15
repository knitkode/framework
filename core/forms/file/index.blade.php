<label class="file formRoot {{ $classRoot ?? '' }}{{ empty($error) ? '' : ' invalid' }}">
  <span class="formBox">
    <span class="formUnderline"></span>
    @isset($icon)
      <x-icon id="{{ $icon }}"/>
    @endisset
    <span class="formTexts">
      <input
        class="formControl {{ $classElement ?? '' }}"
        type="{{ $type ?? 'file' }}"
        id="{{ $id ?? 'input-'.$name }}"
        name="{{ $name }}"
        @unless(empty($placeholder)) placeholder="{{ $placeholder }}"@endunless
        @unless(empty($required)) required="required"@endunless
        {!! $attrs ?? '' !!}
      >
      @unless(empty($label))
        <span class="formLabel">
          {!! $label !!}
          {{ $append ?? '' }}
        </span>
      @endunless
      <span class="fileName"></span>
    </span>
  </span>
  @unless(empty($error))<div class="formFeedback">{{ $error }}</div>@endunless
</label>
