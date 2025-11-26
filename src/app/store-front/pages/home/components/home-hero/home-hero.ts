import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { animate, scroll } from "@motionone/dom";
import { CategoryService } from 'src/app/categories/services/category.service';
import { ProductService } from 'src/app/products/services/products.service';
import { forkJoin, map, of, switchMap, catchError } from 'rxjs';

@Component({
  selector: 'home-hero',
  imports: [RouterLink],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.css',
})
export class HomeHero implements AfterViewInit, OnInit {

  @ViewChild("heroBg") heroBg!: ElementRef<HTMLDivElement>;
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  topCategories = signal<{ id: string; name: string; description?: string; count: number }[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadTopCategories();
  }

  ngAfterViewInit() {
    animate(".hero-title", { opacity: [0, 1], y: ["40px", "0px"] }, { duration: 0.7 });
    animate(".hero-sub", { opacity: [0, 1] }, { duration: 1 });

    scroll(
      ({ y }) => {
        const progress = y.progress;
        this.heroBg.nativeElement.style.transform = `translateY(${progress * 60}px)`;
      },
      { target: this.heroBg.nativeElement }
    );
  }

  private loadTopCategories() {
    this.loading.set(true);
    this.categoryService.getAll().pipe(
      switchMap(categories => {
        if (!categories.length) return of([]);
        const requests = categories.map(cat =>
          this.productService.getProducts({ limit: 1, offset: 0, categoryId: cat.id }).pipe(
            map(res => ({
              id: cat.id,
              name: cat.name,
              description: cat.description,
              count: res.count ?? res.products?.length ?? 0
            }))
          )
        );
        return forkJoin(requests);
      }),
      map(list => list.sort((a, b) => b.count - a.count).slice(0, 4)),
      catchError(() => of([]))
    ).subscribe(list => {
      this.topCategories.set(list);
      this.loading.set(false);
    });
  }
}
