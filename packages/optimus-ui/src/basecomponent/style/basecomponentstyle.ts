import { Injectable } from '@angular/core';
import { BaseStyle } from '@openng/optimus-ui/base';

@Injectable({ providedIn: 'root' })
export class BaseComponentStyle extends BaseStyle {
    name = 'common';
}
