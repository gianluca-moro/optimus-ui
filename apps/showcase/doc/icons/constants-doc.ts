import { Code } from '@/domain/code';
import { Component, OnInit } from '@angular/core';
import { MenuItem, PrimeIcons } from '@openng/optimus-ui/api';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppCode } from '@/components/doc/app.code';
import { MenuModule } from '@openng/optimus-ui/menu';

@Component({
    selector: 'constants-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, MenuModule],
    template: `
        <app-docsectiontext>
            <p>Constants API is available to reference icons easily when used programmatically.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-menu [model]="items"></p-menu>
        </div>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class ConstantsDoc implements OnInit {
    items: MenuItem[];

    ngOnInit() {
        this.items = [
            {
                label: 'New',
                icon: PrimeIcons.PLUS
            },
            {
                label: 'Delete',
                icon: PrimeIcons.TRASH
            }
        ];
    }

    code: Code = {
        typescript: `
import { Component } from '@angular/core';
import { PrimeIcons, MenuItem } from '@openng/optimus-ui/api';

@Component({
    selector: 'prime-icons-constants-demo',
    templateUrl: './prime-icons-constants-demo.html'
})
export class PrimeIconsConstantsDemo {
    items: MenuItem[];

    ngOnInit() {
        this.items = [
            {
                label: 'New',
                icon: PrimeIcons.PLUS,
            },
            {
                label: 'Delete',
                icon: PrimeIcons.TRASH
            }
        ];
    }
}`
    };
}
