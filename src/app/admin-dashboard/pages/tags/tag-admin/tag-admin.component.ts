import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, firstValueFrom } from 'rxjs';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { TagDetailsComponent } from './tag-details/tag-details.component';
import { Tag } from 'src/app/tags/interfaces/tag.interface';
import { TagService } from 'src/app/tags/services/tag.service';

@Component({
  selector: 'tag-admin',
  imports: [LoadingComponent, TagDetailsComponent],
  templateUrl: './tag-admin.component.html',
  styleUrl: './tag-admin.component.css',
})
export class TagAdminComponent {
  private activateRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private tagService = inject(TagService);

  tagId = toSignal(
    this.activateRoute.params.pipe(map(params => params['id']))
  );

  tag = signal<Tag | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.tagId();
      if (id) {
        this.loadTag(id);
      }
    });
  }

  private async loadTag(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const tag = await firstValueFrom(this.tagService.getById(id));
      this.tag.set(tag);
    } catch (err) {
      this.error.set('Error al cargar el tag');
      this.router.navigate(['/admin/tags']);
    } finally {
      this.loading.set(false);
    }
  }
}

