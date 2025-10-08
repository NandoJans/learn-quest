<?php

namespace App\Form\Type;

use App\Entity\Lesson;
use App\Entity\LessonRegistration;
use App\Entity\LessonSection;
use App\Subscriber\HashPasswordSubscriber;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class LessonSectionAnswerType extends AbstractType
{
    public function __construct(
        private readonly HashPasswordSubscriber $subscriber
    ) {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('lessonSection', EntityType::class, [
                'class' => LessonSection::class,
                'choice_label' => 'id',
                'label' => 'Lesson Section',
                'required' => true,
            ])
            ->add('lessonRegistration', EntityType::class, [
                'class' => LessonRegistration::class,
                'choice_label' => 'id',
                'label' => 'Lesson Registration',
                'required' => true,
            ]);

        $builder->addEventSubscriber($this->subscriber);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => LessonSection::class,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'lesson_section_item',
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'lesson_section';
    }
}
