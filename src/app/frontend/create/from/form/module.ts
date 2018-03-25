import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ComponentsModule } from "../../../common/components/module";
import { SharedModule } from "../../../shared.module";
import { CreateFromFormComponent } from "./component";
import { HelpSectionComponent } from "./helpsection/component";
import { UserHelpComponent } from "./helpsection/userhelp/component";
import { UniqueNameValidator } from "./uniquename.validator";

@NgModule({
  declarations: [
    HelpSectionComponent,
    UserHelpComponent,
    CreateFromFormComponent,
    UniqueNameValidator
  ],
  imports: [CommonModule, SharedModule, ComponentsModule],
  exports: [CreateFromFormComponent],
  providers: []
})
export class CreateFromFormModule {}
