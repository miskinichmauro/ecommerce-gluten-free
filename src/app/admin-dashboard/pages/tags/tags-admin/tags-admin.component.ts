import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { TagsTableComponent } from 'src/app/tags/components/tags-table/tags-table.component';
import { Tag } from 'src/app/tags/interfaces/tag.interface';
import { TagService } from 'src/app/tags/services/tag.service';

@Component({
  selector: 'tags-admin',
  imports: [RouterLink, LoadingComponent, TagsTableComponent],
  templateUrl: './tags-admin.component.html',
  styleUrl: './tags-admin.component.css',
})
export class TagsAdminComponent implements OnInit {
  private tagService = inject(TagService);

  tags = signal<Tag[] | null>(null);
  total = computed(() => this.tags()?.length ?? 0);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.getTags();
  }

  async getTags() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.tagService.getAll());
      this.tags.set(data);
    } catch (err) {
      this.error.set('Error al cargar los tags');
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string) {
    try {
      await firstValueFrom(this.tagService.delete(id));
      this.tags.set(this.tags()?.filter(tag => tag.id !== id) ?? null);
    } catch (err) {
      console.error('Error al eliminar tag', err);
      this.error.set('No se pudo eliminar el tag.');
    }
  }
}

