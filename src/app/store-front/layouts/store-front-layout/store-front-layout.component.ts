import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { FrontMenuComponent } from "../../components/front-menu/front-menu.component";

@Component({
  selector: 'app-store-front-layout',
  imports: [RouterOutlet, FrontMenuComponent],
  templateUrl: './store-front-layout.component.html',
})
export class StoreFrontLayoutComponent { }
