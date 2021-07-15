<div class="formGroup {{ $classRoot ?? '' }}">
  @if(isset($prepend))
  <div class="formGroup__prepend">
    {{ $prepend }}
  </div>
  @endif
  <div class="formGroup__main">
    {{ $slot }}
  </div>
  @if(isset($append))
  <div class="formGroup__append">
    {{ $append }}
  </div>
  @endif
</div>
